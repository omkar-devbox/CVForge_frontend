export const sampleBlocks: any[] = [
  {
    id: "mini-project-title",
    type: "paragraph",
    metadata: { align: "center", indent: 0 },
    content: [{ text: "MINI PROJECT\nOn\n\"ARCIMIDES PRINCIPEL\"", marks: [{ type: "bold" }] }]
  },
  {
    id: "synopsis",
    type: "paragraph",
    metadata: { align: "center" },
    content: [
      { text: "A mini project synopsis submitted fulfillment of requirement for the\naward of the award of first year degree of", marks: [{ type: "bold" }] }
    ]
  },
  {
    id: "degree",
    type: "paragraph",
    metadata: { align: "center" },
    content: [
      { text: "BACHELOR OF ENGINEERING IN MECHANICAL", marks: [{ type: "bold" }, { type: "italic" }, { type: "highlight", value: "rgba(191, 219, 254, 0.6)" }] }
    ]
  },
  {
    id: "by",
    type: "paragraph",
    metadata: { align: "center" },
    content: [{ text: "By\nBatch A-1", marks: [{ type: "bold" }, { type: "italic" }] }]
  },
  {
    id: "students",
    type: "table",
    metadata: { width: "300px", align: "center" },
    children: [
      {
        id: "student1",
        type: "tableRow",
        children: [
          { id: "c1-1", type: "tableCell", children: [{ id: "p1-1", type: "paragraph", content: [{ text: "rushikesh chougule", marks: [{ type: "bold" }, { type: "italic" }] }] }] },
          { id: "c1-2", type: "tableCell", children: [{ id: "p1-2", type: "paragraph", content: [{ text: "152", marks: [{ type: "bold" }, { type: "italic" }] }] }] }
        ]
      },
      {
        id: "student2",
        type: "tableRow",
        children: [
          { id: "c2-1", type: "tableCell", children: [{ id: "p2-1", type: "paragraph", content: [{ text: "omkar rege", marks: [{ type: "bold" }, { type: "italic" }] }] }] },
          { id: "c2-2", type: "tableCell", children: [{ id: "p2-2", type: "paragraph", content: [{ text: "153", marks: [{ type: "bold" }, { type: "italic" }] }] }] }
        ]
      },
      {
        id: "student3",
        type: "tableRow",
        children: [
          { id: "c3-1", type: "tableCell", children: [{ id: "p3-1", type: "paragraph", content: [{ text: "paramagandh revankar", marks: [{ type: "bold" }, { type: "italic" }] }] }] },
          { id: "c3-2", type: "tableCell", children: [{ id: "p3-2", type: "paragraph", content: [{ text: "154", marks: [{ type: "bold" }, { type: "italic" }] }] }] }
        ]
      }
    ]
  },
  {
    id: "guidance",
    type: "paragraph",
    metadata: { align: "center" },
    content: [{ text: "Under the guidance of\n", marks: [{ type: "bold" }] }, { text: "Prof. Ambole N.P.", marks: [{ type: "bold" }, { type: "underline" }] }]
  },
  {
    id: "department",
    type: "paragraph",
    metadata: { align: "center" },
    content: [{ text: "DEPARTMENT OF MECHANICAL ENGINEERING", marks: [{ type: "bold" }] }]
  }
];
