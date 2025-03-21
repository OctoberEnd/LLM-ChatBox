import { MessageApiInter, ResponseRetrieveInter } from "~/types";
import { getBotId, getToken, getCustomProxyUrl } from "~/utils/oauth";
import { getStorageSetting, updateTwoToken } from "~/utils/storage";

// 实现了与后端 API 的交互，主要涉及聊天、文件上传、轮询、消息详情获取、OAuth 授权和令牌管理等功能

// 代理地址
export const cn_proxy_url = "https://api.coze.cn";
export const ncn_proxy_url = "https://api.coze.com";
// dev
// const redirect_uri = "http://localhost:5173/";
// pro
const redirect_uri = "http://175.178.3.60:3000/";

// 发送聊天消息到后端
export const asyncChat = async (
  messages: MessageApiInter[],
  abort: AbortController
) => {
  return await fetch(`${getCustomProxyUrl()}/v3/chat`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_id: getBotId(),
      user_id: "1111",
      stream: getStorageSetting()?.stream,
      auto_save_history: true,
      additional_messages: messages,
    }),
    signal: abort.signal,
  });
};
// 文件上传
export const asyncFileUpload = async (file: File) => {
  try {
    console.log("file", file);

    const form_data = new FormData();
    form_data.append("file", file);
    const res = await fetch(`${getCustomProxyUrl()}/v1/files/upload`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      body: form_data,
    });
    const jsonData = await res.json();
    if (
      jsonData.code == 700012006 &&
      getStorageSetting()?.auth_type === "two"
    ) {
      const tokenRes = await asyncRefreshToken();
      const tokenData = await tokenRes.json();
      updateTwoToken(tokenData.access_token, tokenData.refresh_token);
      await asyncFileUpload(file);
    }
    return jsonData;
  } catch (err) {
    console.error(err);
  }
};
// 轮询
export const asyncRetrievePolling = async (
  conversation_id: string,
  chat_id: string
): Promise<ResponseRetrieveInter> => {
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `${getCustomProxyUrl()}/v3/chat/retrieve?conversation_id=${conversation_id}&chat_id=${chat_id}`,
          {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          }
        );
        const jsonData = await res.json();
        console.log("jsonData", jsonData);

        if (jsonData.data.status === "completed") {
          clearInterval(timer);
          const messageDetail = await (
            await asyncMessageDetail(conversation_id, chat_id)
          ).json();
          resolve(messageDetail);
        } else if (jsonData.data.status !== "in_progress") {
          clearInterval(timer);
          reject(jsonData.msg || "Request failed");
        }
      } catch (error) {
        clearInterval(timer);
        reject(error);
      }
    }, 2000);
  });
};
// 消息详情
export const asyncMessageDetail = async (
  conversation_id: string,
  chat_id: string
) => {
  return await fetch(
    `${getCustomProxyUrl()}/v3/chat/message/list?conversation_id=${conversation_id}&chat_id=${chat_id}`,
    {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
    }
  );
};
// 授权
export const asyncOAuth = async (code_challenge: string) => {
  const query = {
    client_id: getStorageSetting()?.client_id,
    response_type: "code",
    redirect_uri,
    state: Math.random().toString(36).substring(2, 15),
    code_challenge,
    code_challenge_method: "S256",
  };
  // return await fetch(
  //   `${proxy_url}/auth/permission/oauth2/authorize?${new URLSearchParams(
  //     query
  //   ).toString()}`,
  //   {
  //     method: "GET",
  //   }
  // );
  window.location.href = `${
    getStorageSetting()?.custom_url
  }api/permission/oauth2/authorize?${new URLSearchParams(query).toString()}`;
};
// 授权token
export const asyncOAuthToken = async (code: string, code_verifier: string) => {
  return await fetch(`${getCustomProxyUrl()}/api/permission/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: getStorageSetting()?.client_id,
      code,
      redirect_uri,
      code_verifier,
    }),
  });
};
// 刷新token
export const asyncRefreshToken = async () => {
  const refresh_token = getStorageSetting()?.refresh_token;
  return await fetch(`${getCustomProxyUrl()}/api/permission/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: getStorageSetting()?.client_id,
      refresh_token,
    }),
  });
};
