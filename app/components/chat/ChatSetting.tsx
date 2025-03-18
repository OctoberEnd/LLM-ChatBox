/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { SettingInter } from "~/types";
import { getStorageSetting, setStorageSetting } from "~/utils/storage";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { generateCodeChallenge } from "~/utils/oauth";
import { asyncOAuth } from "~/apis/data";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import SPopover from "../setting/SPopover";

export default function ChatSetting() {
  const [setting, setSetting] = useState<SettingInter>();

  // 获取设置
  useEffect(() => {
    const setting = getStorageSetting();
    if (!setting?.auth_type) {
      const initSetting: SettingInter = {
        auth_type: "one",
        stream: true,
        custom_url: "https://www.coze.cn/",
      };
      setSetting(initSetting);
      setStorageSetting(initSetting);
    } else setSetting(setting);
  }, []);

  // 保存设置
  const saveSetting = () => {
    setStorageSetting(setting);
    toast.success("保存成功");
  };

  // 授权
  const handleOAuth = async () => {
    if (!setting?.client_id || !setting?.bot_id2) {
      toast.error("请填写完整的客户端 ID 和机器人 ID");
      return;
    }
    const codeChallenge = generateCodeChallenge();
    console.log(codeChallenge);
    const res = await asyncOAuth(codeChallenge);
    console.log(res);
  };
  useEffect(() => {
    if (setting) {
      setStorageSetting(setting);
    }
  }, [setting]);
  return (
    <div className="flex items-center">
      <Dialog>
        <DialogTrigger
          aria-label="设置"
          className="hover:opacity-80 transition-opacity"
        >
          <Cog6ToothIcon className="w-7 h-7 text-muted-foreground hover:text-foreground" />
        </DialogTrigger>

        <DialogContent className="min-h-[200px] max-w-screen-md rounded-xl border-border shadow-lg">
          <DialogTitle className="text-lg font-semibold mb-4">设置</DialogTitle>

          <div className="flex flex-col gap-6 flex-1">
            <RadioGroup
              value={setting?.auth_type}
              onValueChange={(value) => {
                setSetting({ ...setting, auth_type: value as "one" | "two" });
              }}
              defaultValue={setting?.auth_type}
              className="space-y-4"
            >
              {/* 个人访问令牌设置 */}
              <div className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <RadioGroupItem value="one" id="one" />
                  <label htmlFor="one" className="font-medium">
                    个人访问令牌
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href="https://www.coze.cn/docs/developer_guides/pat"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      个人访问令牌
                    </a>
                    <span>和</span>
                    <SPopover />
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    value={setting?.token}
                    onChange={(e) =>
                      setSetting({ ...setting, token: e.target.value })
                    }
                    className="w-full max-w-md"
                    placeholder="请输入访问令牌..."
                  />
                  <Input
                    value={setting?.bot_id}
                    onChange={(e) =>
                      setSetting({ ...setting, bot_id: e.target.value })
                    }
                    className="w-full max-w-md"
                    placeholder="请输入机器人 ID..."
                  />
                </div>
              </div>

              {/* OAuth PKCE 设置 */}
              {/* <div className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <RadioGroupItem value="two" id="two" />
                  <label htmlFor="two" className="font-medium">
                    OAuth PKCE 访问令牌
                  </label>
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href="https://www.coze.cn/docs/developer_guides/oauth_pkce"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      客户端 ID
                    </a>
                    <span>和</span>
                    <SPopover />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-red-500 text-sm">
                    创建 OAuth 应用，填写重定向 URL：http://175.178.3.60:3000/
                  </p>
                  <Input
                    value={setting?.client_id}
                    onChange={(e) =>
                      setSetting({ ...setting, client_id: e.target.value })
                    }
                    className="w-full max-w-md"
                    placeholder="请输入客户端 ID..."
                  />
                  <Input
                    value={setting?.bot_id2}
                    onChange={(e) =>
                      setSetting({ ...setting, bot_id2: e.target.value })
                    }
                    className="w-full max-w-md"
                    placeholder="请输入机器人 ID..."
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">填写完成后，点击</span>
                    <Button
                      onClick={handleOAuth}
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground"
                    >
                      授权
                    </Button>
                    <span className="text-sm">获取访问令牌</span>
                  </div>
                </div>
              </div> */}

              {/* <p className="text-sm text-muted-foreground italic">
                注意：以上数据仅保存在本地，不会上传到服务器
              </p> */}
            </RadioGroup>

            {/* 其他设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <label htmlFor="stream" className="text-sm font-medium">
                  启用流式输出
                </label>
                <Switch
                  id="stream"
                  checked={setting?.stream}
                  onCheckedChange={(e) => setSetting({ ...setting, stream: e })}
                />
              </div>

              {/* <div className="space-y-2">
                <p className="text-sm font-medium text-red-500">
                  自定义请求前缀
                </p>
                <p className="text-sm text-muted-foreground">
                  默认使用{" "}
                  <code className="px-1 py-0.5 rounded bg-muted">
                    https://www.coze.cn/
                  </code>
                </p>
                <p className="text-sm text-muted-foreground">
                  可以填写{" "}
                  <code className="px-1 py-0.5 rounded bg-muted">
                    https://www.coze.com/
                  </code>{" "}
                  但需要获取对应网站的配置数据
                </p>
                <Input
                  value={setting?.custom_url}
                  onChange={(e) =>
                    setSetting({ ...setting, custom_url: e.target.value })
                  }
                  className="w-full max-w-md"
                  placeholder="请输入自定义请求前缀..."
                />
              </div> */}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={saveSetting}
              className="min-w-[100px]"
              variant="default"
            >
              保存设置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
