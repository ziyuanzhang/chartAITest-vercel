import { post } from "@/uitls/api";

export const submitContext = (data: object) =>
  post<any>("/api/chat/start", data);
