<script setup lang="ts">
import { submitContext } from "@/api/chart";
import { reactive } from "vue";
defineOptions({
  name: "chart"
});
let form = reactive({
  api_key: "",
  content: ""
});

const handleSubmit = async () => {
  let data = {
    api_key: "",
    content: form.content
  };
  let res = await submitContext(data);
  if (res?.code === "success") {
    console.log("提交成功");
  }
};
</script>

<template>
  <div>chart</div>
  <div>
    <input type="text" v-model="form.api_key" placeholder="请输入api_key" />
  </div>
  <div>
    <input type="text" v-model="form.content" placeholder="请输入内容" />
  </div>
  <button @click="handleSubmit">提交</button>
</template>

<style lang="scss" scoped></style>
