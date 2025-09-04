import { post } from "@/uitls/api";

export const submitContext = (data: object) => post("/api/chart", data);
