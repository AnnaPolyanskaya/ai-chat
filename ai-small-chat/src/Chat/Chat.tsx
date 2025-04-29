"use client";

import { useMutation } from "@tanstack/react-query";
import { Button, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import { askQuestion } from "./actions/askQuestion";

const { TextArea } = Input;

export const Chat = () => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: askQuestion,
    onSuccess: (data) => {
      setHistory((prev) => [...prev, { question, answer: data.answer }]);
      setQuestion("");
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (question.trim()) {
      mutation.mutate(question);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4">
      <div className="flex flex-col gap-2 mb-4 max-h-[400px] overflow-y-auto border p-3 rounded bg-white shadow-sm">
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="bg-blue-100 p-2 rounded mb-1 w-[50%] ml-auto mb-2 text-black flex justify-between ">
              <div>
                <strong>You:</strong>
              </div>
              <div>{item.question}</div>
            </div>
            <div className="bg-gray-100 p-2 rounded w-[50%] mr-auto text-black">
              <div>
                <strong>Bot:</strong>{" "}
              </div>
              <div>{item.answer}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <TextArea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              handleSubmit(e);
            }
          }}
          placeholder="Type your message here..."
        />
        <Button type="primary" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? "Asking..." : "Send"}
        </Button>
      </form>
    </div>
  );
};
