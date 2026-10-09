import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeightRule,
  Packer,
} from "docx";

export interface BniOvertimeDay {
  day: number;
  dateFormatted: string; // e.g. "Minggu 6 September 2026"
  dateShort: string; // e.g. "6-Sep-26"
  dateWithYear: string; // e.g. "6 September 2026"
  jamMasuk: string;
  jamPulang: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string | null;
  kegiatan: string;
}

export interface BniOvertimeData {
  profile: {
    nama: string;
    npp: string;
    staffId: string;
    divisi: string;
    departemen: string;
    location: string;
    pemohonName: string;
    diperiksaName: string;
    disetujuiName: string;
    standardCheckOut?: string;
    estOvertimeStart: string; // e.g. "17.00"
    estOvertimeEnd: string; // e.g. "20.00"
  };
  signingDateStr: string; // e.g. "01 Oktober 2026"
  overtimeDays: BniOvertimeDay[];
}

export type BniOvertimeCategory = "workday" | "weekend" | "hariRaya" | "cutiBersama";

function buildBniSection(
  category: BniOvertimeCategory,
  days: BniOvertimeDay[],
  data: BniOvertimeData
) {
  const isWorkday = category === "workday";
  const isWeekend = category === "weekend";
  const isHariRaya = category === "hariRaya";
  const isCutiBersama = category === "cutiBersama";

  const singleBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
  const noBorder = { style: BorderStyle.NONE };
  const noBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideHorizontal: noBorder,
    insideVertical: noBorder,
  };

  const datesListStr =
    days.length > 0 ? days.map((d) => d.dateFormatted).join("; ") + ";" : "-";

  // Task bullet list
  const taskParagraphs =
    days.length > 0
      ? days.map((d) => {
          let taskText = (d.kegiatan || "Penyelesaian tugas sprint dan fixing defect").trim();
          if (taskText.startsWith(`${d.dateWithYear} -`)) {
            taskText = taskText.substring(`${d.dateWithYear} -`.length).trim();
          } else if (taskText.startsWith(`${d.dateWithYear} :`)) {
            taskText = taskText.substring(`${d.dateWithYear} :`.length).trim();
          }

          return new Paragraph({
            spacing: { before: 20, after: 20 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `${d.dateWithYear} - ${taskText}`,
                font: "Arial",
                size: 20,
              }),
            ],
          });
        })
      : [
          new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [
              new TextRun({
                text: "- Tidak ada kegiatan lembur -",
                font: "Arial",
                size: 20,
                italics: true,
              }),
            ],
          }),
        ];

  // Hours Table
  const tableRows: TableRow[] = [
    // Header Row 1: Tanggal | Mulai (jam) | Selesai (jam)
    new TableRow({
      children: [
        new TableCell({
          rowSpan: 2,
          width: { size: 28, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Tanggal", bold: true, font: "Arial", size: 20 })],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 36, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 50, bottom: 50, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Mulai (jam)", bold: true, font: "Arial", size: 20 })],
            }),
          ],
        }),
        new TableCell({
          columnSpan: 2,
          width: { size: 36, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 50, bottom: 50, left: 60, right: 60 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Selesai (jam)", bold: true, font: "Arial", size: 20 })],
            }),
          ],
        }),
      ],
    }),
    // Sub-header: Estimasi | Realisasi | Estimasi | Realisasi
    new TableRow({
      children: [
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Estimasi", bold: true, font: "Arial", size: 19 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Realisasi", bold: true, font: "Arial", size: 19 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Estimasi", bold: true, font: "Arial", size: 19 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Realisasi", bold: true, font: "Arial", size: 19 })],
            }),
          ],
        }),
      ],
    }),
  ];

  // Data rows
  if (days.length > 0) {
    days.forEach((d) => {
      const estStart = isWorkday
        ? data.profile.estOvertimeStart || "17.00"
        : d.jamMasuk || "9:30";
      const realStart = isWorkday
        ? data.profile.standardCheckOut || "17:00"
        : d.jamMasuk || "9:30";
      const estEnd = data.profile.estOvertimeEnd || "20.00";
      const realEnd = d.jamPulang || "21:00";

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
              margins: { top: 40, bottom: 40, left: 60, right: 60 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: d.dateWithYear, font: "Arial", size: 19 })],
                }),
              ],
            }),
            new TableCell({
              borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
              margins: { top: 40, bottom: 40, left: 40, right: 40 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: estStart, font: "Arial", size: 19 })],
                }),
              ],
            }),
            new TableCell({
              borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
              margins: { top: 40, bottom: 40, left: 40, right: 40 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: realStart, font: "Arial", size: 19 })],
                }),
              ],
            }),
            new TableCell({
              borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
              margins: { top: 40, bottom: 40, left: 40, right: 40 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: estEnd, font: "Arial", size: 19 })],
                }),
              ],
            }),
            new TableCell({
              borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
              margins: { top: 40, bottom: 40, left: 40, right: 40 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: realEnd, font: "Arial", size: 19 })],
                }),
              ],
            }),
          ],
        })
      );
    });
  }

  return {
    properties: {
      page: {
        margin: {
          top: 1440, // 1"
          bottom: 907, // 0.63"
          left: 1440, // 1"
          right: 1440, // 1"
          gutter: 0, // 0"
        },
      },
    },
    children: [
      // 1. Company Header
      new Paragraph({
        children: [
          new TextRun({
            text: "PT. BANK NEGARA INDONESIA Tbk,",
            bold: true,
            font: "Arial",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: data.profile.divisi.toUpperCase().includes("DIVISI")
              ? data.profile.divisi.toUpperCase()
              : `DIVISI ${data.profile.divisi.toUpperCase()}`,
            bold: true,
            font: "Arial",
            size: 22,
          }),
        ],
      }),

      // 2. Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 160 },
        children: [
          new TextRun({
            text: "FORMULIR PERINTAH DAN PERSETUJUAN LEMBUR",
            bold: true,
            font: "Arial",
            size: 22,
          }),
        ],
      }),

      // 3. Metadata Block
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: "Kepada nama pegawai berikut ini",
            font: "Arial",
            size: 20,
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({})] }),
              new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ children: [new TextRun({ text: "Nama Pegawai", font: "Arial", size: 20 })] })] }),
              new TableCell({ width: { size: 79, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ children: [new TextRun({ text: `: ${data.profile.nama}`, font: "Arial", size: 20 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({})] }),
              new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: "NPP", font: "Arial", size: 20 })] })] }),
              new TableCell({ width: { size: 79, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: `: ${data.profile.npp}`, font: "Arial", size: 20 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({})] }),
              new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: "Staff ID", font: "Arial", size: 20 })] })] }),
              new TableCell({ width: { size: 79, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: `: ${data.profile.staffId || "-"}`, font: "Arial", size: 20, bold: true })] })] }),
            ],
          }),
        ],
      }),

      new Paragraph({
        spacing: { before: 50, after: 20 },
        children: [
          new TextRun({
            text: "diperintahkan untuk kerja lembur pada:",
            font: "Arial",
            size: 20,
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({})] }),
              new TableCell({ width: { size: 16, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ children: [new TextRun({ text: "Hari/tanggal", font: "Arial", size: 20 })] })] }),
              new TableCell({ width: { size: 79, type: WidthType.PERCENTAGE }, borders: noBorders, children: [new Paragraph({ children: [new TextRun({ text: `: ${datesListStr}`, font: "Arial", size: 20 })] })] }),
            ],
          }),
        ],
      }),

      // 4. Checklist Box
      new Paragraph({
        spacing: { before: 70, after: 30 },
        children: [
          new TextRun({
            text: "Jenis lembur (pilih salah satu):",
            font: "Arial",
            size: 20,
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: singleBorder,
          bottom: singleBorder,
          left: singleBorder,
          right: singleBorder,
          insideVertical: singleBorder,
          insideHorizontal: noBorder,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                borders: { top: singleBorder, bottom: noBorder, left: singleBorder, right: singleBorder },
                margins: { top: 35, bottom: 15, left: 80, right: 60 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: isWorkday ? "\u2611  " : "\u2610  ", font: "Arial", size: 20 }),
                      new TextRun({ text: "Reguler (Hari Kerja)", font: "Arial", size: 20 }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                borders: { top: singleBorder, bottom: noBorder, left: singleBorder, right: singleBorder },
                margins: { top: 35, bottom: 15, left: 80, right: 60 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: isCutiBersama ? "\u2611  " : "\u2610  ", font: "Arial", size: 20 }),
                      new TextRun({ text: "Hari Cuti Bersama", font: "Arial", size: 20 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                borders: { top: noBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                margins: { top: 15, bottom: 35, left: 80, right: 60 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: isWeekend ? "\u2611  " : "\u2610  ", font: "Arial", size: 20 }),
                      new TextRun({ text: "Hari Sabtu/Minggu (Libur Normal)", font: "Arial", size: 20 }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                borders: { top: noBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                margins: { top: 15, bottom: 35, left: 80, right: 60 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: isHariRaya ? "\u2611  " : "\u2610  ", font: "Arial", size: 20 }),
                      new TextRun({ text: "Hari Raya", font: "Arial", size: 20 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),

      // 5. Tasks Bullet List
      new Paragraph({
        spacing: { before: 70, after: 30 },
        children: [
          new TextRun({
            text: "Pekerjaan yang dilemburkan :",
            font: "Arial",
            size: 20,
          }),
        ],
      }),
      ...taskParagraphs,

      // 6. Hours Table
      new Paragraph({ spacing: { before: 50 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: singleBorder,
          bottom: singleBorder,
          left: singleBorder,
          right: singleBorder,
          insideHorizontal: singleBorder,
          insideVertical: singleBorder,
        },
        rows: tableRows,
      }),

      // 7. Closing & Date
      new Paragraph({
        spacing: { before: 80, after: 40 },
        children: [
          new TextRun({
            text: "Demikian untuk dimaklumi.",
            font: "Arial",
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 70 },
        children: [
          new TextRun({
            text: `${data.profile.location || "Jakarta"}, ${data.signingDateStr}`,
            font: "Arial",
            size: 20,
          }),
        ],
      }),

      // 8. Signatures Box (Empty space for physical / digital signing, no signature image)
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: singleBorder,
          bottom: singleBorder,
          left: singleBorder,
          right: singleBorder,
          insideHorizontal: noBorder,
          insideVertical: singleBorder,
        },
        rows: [
          new TableRow({
            height: { value: 1300, rule: HeightRule.ATLEAST },
            children: [
              new TableCell({
                width: { size: 33.3, type: WidthType.PERCENTAGE },
                borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                margins: { top: 50, bottom: 50, left: 70, right: 70 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Yang Mengajukan", font: "Arial", size: 20 })],
                  }),
                  new Paragraph({
                    spacing: { before: 850 },
                    children: [new TextRun({ text: data.profile.pemohonName || data.profile.nama, font: "Arial", size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 33.3, type: WidthType.PERCENTAGE },
                borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                margins: { top: 50, bottom: 50, left: 70, right: 70 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Mengetahui", font: "Arial", size: 20 })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: "Team Leader", font: "Arial", size: 20 })],
                  }),
                  new Paragraph({
                    spacing: { before: 650 },
                    children: [new TextRun({ text: data.profile.diperiksaName, font: "Arial", size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 33.4, type: WidthType.PERCENTAGE },
                borders: { top: singleBorder, bottom: singleBorder, left: singleBorder, right: singleBorder },
                margins: { top: 50, bottom: 50, left: 70, right: 70 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Mengetahui", font: "Arial", size: 20 })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: "Dept Head", font: "Arial", size: 20 })],
                  }),
                  new Paragraph({
                    spacing: { before: 650 },
                    children: [new TextRun({ text: data.profile.disetujuiName, font: "Arial", size: 20 })],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  };
}

export async function generateBniDocx(data: BniOvertimeData): Promise<Buffer> {
  // Separate overtime days into categories: Workday, Weekend, Hari Raya, Cuti Bersama
  const workdayDays: BniOvertimeDay[] = [];
  const weekendDays: BniOvertimeDay[] = [];
  const hariRayaDays: BniOvertimeDay[] = [];
  const cutiBersamaDays: BniOvertimeDay[] = [];

  for (const d of data.overtimeDays) {
    if (d.isHoliday) {
      if (d.holidayName?.toLowerCase().includes("cuti bersama")) {
        cutiBersamaDays.push(d);
      } else {
        hariRayaDays.push(d);
      }
    } else if (d.isWeekend) {
      weekendDays.push(d);
    } else {
      workdayDays.push(d);
    }
  }

  // Sequence of forms: Workday -> Weekend -> Hari Raya -> Cuti Bersama
  const sectionsToBuild: Array<{
    category: BniOvertimeCategory;
    days: BniOvertimeDay[];
  }> = [];

  if (workdayDays.length > 0) {
    sectionsToBuild.push({ category: "workday", days: workdayDays });
  }

  if (weekendDays.length > 0) {
    sectionsToBuild.push({ category: "weekend", days: weekendDays });
  }

  if (hariRayaDays.length > 0) {
    sectionsToBuild.push({ category: "hariRaya", days: hariRayaDays });
  }

  if (cutiBersamaDays.length > 0) {
    sectionsToBuild.push({ category: "cutiBersama", days: cutiBersamaDays });
  }

  // If no overtime days exist at all, generate 1 default workday form
  if (sectionsToBuild.length === 0) {
    sectionsToBuild.push({ category: "workday", days: [] });
  }

  const sections = sectionsToBuild.map((item) =>
    buildBniSection(item.category, item.days, data)
  );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 20,
          },
          paragraph: {
            spacing: { line: 240 },
          },
        },
      },
    },
    sections,
  });

  return await Packer.toBuffer(doc);
}
