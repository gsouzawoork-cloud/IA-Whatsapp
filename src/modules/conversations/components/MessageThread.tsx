import { formatTime } from "@/lib/format";
import type { Message, MessageAuthorType } from "../types";

const BUBBLE_STYLES: Readonly<Record<MessageAuthorType, string>> = {
  customer: "self-start bg-neutral-800 text-neutral-100 rounded-bl-sm",
  ai: "self-end bg-emerald-500/15 text-emerald-50 border border-emerald-500/25 rounded-br-sm",
  human: "self-end bg-sky-500/15 text-sky-50 border border-sky-500/25 rounded-br-sm",
  system: "",
};

const AUTHOR_LABELS: Readonly<Record<MessageAuthorType, string>> = {
  customer: "Cliente",
  ai: "IA",
  human: "Atendente",
  system: "Sistema",
};

function SystemMessage({ message }: { message: Message }) {
  return (
    <li className="self-center">
      <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] text-neutral-500">
        {message.content} · {formatTime(message.createdAt)}
      </span>
    </li>
  );
}

function Bubble({ message }: { message: Message }) {
  return (
    <li className={`flex max-w-[80%] flex-col ${message.authorType === "customer" ? "self-start items-start" : "self-end items-end"}`}>
      <div className={`rounded-2xl px-3.5 py-2 text-sm ${BUBBLE_STYLES[message.authorType]}`}>
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide opacity-60">
          {message.authorType === "human" || message.authorType === "ai"
            ? message.authorName
            : AUTHOR_LABELS[message.authorType]}
        </p>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      <span className="mt-0.5 px-1 text-[10px] text-neutral-500">
        {formatTime(message.createdAt)}
        {message.authorType !== "customer" && message.read ? " · lida" : ""}
      </span>
    </li>
  );
}

/** Histórico de mensagens diferenciando cliente, IA, atendente e sistema. */
export function MessageThread({ messages }: { messages: readonly Message[] }) {
  return (
    <ul className="flex flex-col gap-2.5 p-4">
      {messages.map((message) =>
        message.authorType === "system" ? (
          <SystemMessage key={message.id} message={message} />
        ) : (
          <Bubble key={message.id} message={message} />
        ),
      )}
    </ul>
  );
}
