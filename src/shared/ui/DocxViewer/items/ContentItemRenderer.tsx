import React from "react";
import type {
  DocxContentItem,
  DocxParagraph,
  DocxTable,
} from "../types/docxBridge.types";
import { Paragraph } from "./Paragraph";
import { Table } from "./Table";

export interface ContentItemRendererProps {
  item: DocxContentItem;
  inHeaderFooter?: boolean;
}

export const ContentItemRenderer: React.FC<ContentItemRendererProps> = ({
  item,
  inHeaderFooter = false,
}) => {
  if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
    return <Table table={item as DocxTable} inHeaderFooter={inHeaderFooter} />;
  }
  return (
    <Paragraph
      paragraph={item as DocxParagraph}
      inHeaderFooter={inHeaderFooter}
    />
  );
};
