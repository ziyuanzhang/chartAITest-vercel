<script setup lang="ts">
import { submitContext } from "@/api/chart";
import { onMounted, reactive, ref } from "vue";
defineOptions({
  name: "chart"
});
let form = reactive({
  api_key: "",
  content: ""
});

const handleSubmit = async () => {
  let data = {
    api_key: form.api_key,
    content: form.content
  };
  let res = await submitContext(data);
  if (res?.code === "success") {
    console.log("提交成功");
    const eventSource = new EventSource("/events");
    eventSource.onmessage = function (event) {
      const newElement = document.createElement("div");
      newElement.innerText = event.data;
      divRef.value && divRef.value.appendChild(newElement);
    };
  }
};
const divRef = ref<HTMLDivElement | null>(null);
onMounted(() => {});
</script>

<template>
  <div>chart</div>
  <div>
    <input type="text" v-model="form.api_key" placeholder="请输入api_key" />
  </div>
  <div>
    <textarea type="text" v-model="form.content" placeholder="请输入内容" />
  </div>
  <button @click="handleSubmit">提交</button>
  <div ref="divRef"></div>
</template>

<style lang="scss" scoped></style>
