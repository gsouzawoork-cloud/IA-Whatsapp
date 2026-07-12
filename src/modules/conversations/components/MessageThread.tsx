import { Bot } from "lucide-react";
import { dayKey, formatDayLabel, formatTime } from "@/lib/format";
import type { Message, MessageAuthorType } from "../types";

const BUBBLE_STYLES: Readonly<Record<MessageAuthorType, string>> = {
  customer:
    "bg-surface-3 text-hi border border-line rounded-bl-md elev-low",
  ai: "bg-ok/10 text-emerald-50 border border-ok/25 rounded-br-md",
  human: "bg-info/12 text-sky-50 border border-info/25 rounded-br-md",
  system: "",
};

function SystemMessage({ message }: { message: Message }) {
  return (
    <li className="flex justify-center">
      <span className="rounded-full border border-subtle bg-white/[0.03] px-3 py-1 text-[11px] text-low">
        {message.content} · {formatTime(message.createdAt)}
      </span>
    </li>
  );
}

function Bubble({ message }: { message: Message }) {
  const isCustomer = message.authorType === "customer";
  return (
    <li className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${BUBBLE_STYLES[message.authorType]}`}
      >
        {message.authorType !== "customer" ? (
          <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide opacity-70">
            {message.authorType === "ai" ? (
              <Bot className="h-3 w-3" aria-hidden />
            ) : null}
            {message.authorName}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
      <span className="mt-1 px-1 text-[10px] text-dim">
        {formatTime(message.createdAt)}
        {!isCustomer && message.read ? " · lida" : ""}
      </span>
    </li>
  );
}

/** Histórico de mensagens com separadores de data e balões diferenciados. */
export function MessageThread({ messages }: { messages: readonly Message[] }) {
  const items = messages.map((message, index) => {
    const previous = index > 0 ? messages[index - 1] : undefined;
    const showDay =
      !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
    return { message, showDay };
  });

  return (
    <ul className="flex flex-col gap-2.5 px-4 py-5">
      {items.map(({ message, showDay }) => {
        return (
          <div key={message.id} className="contents">
            {showDay ? (
              <li className="flex justify-center py-1">
                <span className="rounded-full border border-subtle bg-surface-1 px-3 py-0.5 text-[11px] font-semibold text-low">
                  {formatDayLabel(message.createdAt)}
                </span>
              </li>
            ) : null}
            {message.authorType === "system" ? (
              <SystemMessage message={message} />
            ) : (
              <Bubble message={message} />
            )}
          </div>
        );
      })}
    </ul>
  );
}
