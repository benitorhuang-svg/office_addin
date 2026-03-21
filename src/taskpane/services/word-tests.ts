import { WordAction } from "../types";

export type WordTestAction = {
  id: string;
  label: string;
  status: string;
  buildActions(promptText?: string): WordAction[];
};

export const WORD_TEST_ACTIONS: WordTestAction[] = [
  {
    id: "test-page-number",
    label: "頁碼",
    status: "Inserted page numbers into the footer.",
    buildActions: () => [{ type: "insert_page_number", pageNumberPosition: "bottom" }],
  },
  {
    id: "test-toc",
    label: "TOC",
    status: "Inserted a table of contents placeholder.",
    buildActions: () => [
      { type: "insert_table_of_contents", upperHeadingLevel: 1, lowerHeadingLevel: 3 },
    ],
  },
  {
    id: "test-accept-revisions",
    label: "接受修訂",
    status: "Accepted tracked changes when available.",
    buildActions: () => [{ type: "accept_tracked_changes" }],
  },
  {
    id: "test-reject-revisions",
    label: "拒絕修訂",
    status: "Rejected tracked changes when available.",
    buildActions: () => [{ type: "reject_tracked_changes" }],
  },
  {
    id: "test-reply-comment",
    label: "回覆批註",
    status: "Attempted to reply to the latest available comment.",
    buildActions: (promptText) => [
      { type: "reply_to_comment", replyText: promptText || "已收到，稍後處理。" },
    ],
  },
];
