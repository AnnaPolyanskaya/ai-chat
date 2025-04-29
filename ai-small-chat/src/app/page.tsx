import { Chat } from "@/Chat/Chat";
import { Flex } from "antd";

export default function Home() {
  return (
    <div className="mt-4">
      <Flex vertical align="center" justify="center">
        <Chat />
      </Flex>
    </div>
  );
}
