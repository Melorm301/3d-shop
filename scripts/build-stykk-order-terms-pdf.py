#!/usr/bin/env python3
"""Build the compact durable-medium legal attachment for STYKK order emails."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "wordpress-plugin/stykk-commerce/assets/pdf/STYKK - Ordrevilkår og fortrydelse.pdf"

PAPER = colors.HexColor("#F5F2EA")
INK = colors.HexColor("#292C27")
MUTED = colors.HexColor("#66675E")
GREEN = colors.HexColor("#46513C")
RULE = colors.HexColor("#D9D6CC")
PALE = colors.HexColor("#E8EBE4")


class TermsDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=23*mm, rightMargin=23*mm,
                         topMargin=29*mm, bottomMargin=23*mm,
                         title="STYKK – Ordrevilkår og fortrydelse",
                         author="STYKK – Design", subject="Ordrevilkår og standardfortrydelsesformular")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="stykk", frames=frame, onPage=self._decorate)])

    def _decorate(self, canvas, doc):
        w, h = A4
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)
        canvas.setFillColor(INK)
        canvas.setFont("Helvetica-Bold", 18)
        canvas.drawString(23*mm, h-17*mm, "STYKK")
        canvas.setFillColor(GREEN)
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(w-23*mm, h-15.5*mm, "DESIGN · ORDREINFORMATION")
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(.6)
        canvas.line(23*mm, h-21*mm, w-23*mm, h-21*mm)
        canvas.line(23*mm, 17*mm, w-23*mm, 17*mm)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawString(23*mm, 11.5*mm, "STYKK – Design  ·  CVR 41693908  ·  support@stykk.dk")
        canvas.drawRightString(w-23*mm, 11.5*mm, f"{doc.page}")
        canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleST", fontName="Helvetica-Bold", fontSize=23, leading=27,
                          textColor=INK, spaceAfter=5*mm, alignment=TA_LEFT))
styles.add(ParagraphStyle(name="DeckST", fontName="Helvetica", fontSize=10, leading=15,
                          textColor=MUTED, spaceAfter=5*mm))
styles.add(ParagraphStyle(name="SectionST", fontName="Helvetica-Bold", fontSize=12, leading=15,
                          textColor=INK, spaceBefore=3.5*mm, spaceAfter=1.6*mm, keepWithNext=True))
styles.add(ParagraphStyle(name="BodyST", fontName="Helvetica", fontSize=9.3, leading=13.2,
                          textColor=INK, spaceAfter=2.1*mm))
styles.add(ParagraphStyle(name="SmallST", fontName="Helvetica", fontSize=8.5, leading=12,
                          textColor=MUTED, spaceAfter=1.4*mm))
styles.add(ParagraphStyle(name="LabelST", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                          textColor=GREEN))
styles.add(ParagraphStyle(name="FormST", fontName="Helvetica", fontSize=9, leading=13,
                          textColor=INK, spaceAfter=2*mm))


def P(text, style="BodyST"):
    return Paragraph(text, styles[style])


def decorate_box(content, background=PALE, padding=9):
    t = Table([[content]], colWidths=[None])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), .5, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
    ]))
    return t


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = TermsDoc(str(OUTPUT))
    story = [
        P("Ordrevilkår<br/>og fortrydelse", "TitleST"),
        P("Information vedrørende din bestilling hos STYKK – Design. Ordrespecifikke varer, valgte varianter, priser og levering fremgår af ordrebekræftelsen i e-mailen.", "DeckST"),
        decorate_box([
            P("SÆLGER", "LabelST"),
            P("STYKK – Design · CVR 41693908<br/>Damagervej 12 B, st. 6, 8260 Viby J, Danmark<br/>support@stykk.dk", "BodyST"),
        ]),
        P("Pris og levering", "SectionST"),
        P("Prisen i webshoppen er den endelige katalogpris i danske kroner. STYKK er ikke momsregistreret, og der beregnes derfor ikke moms. Fragt til Danmark er 42 kr. pr. ordre. Forventet levering for katalogvarer er normalt 3–7 hverdage, medmindre andet er oplyst for varen eller aftalt særskilt.", "BodyST"),
        P("Hvornår er aftalen bindende?", "SectionST"),
        P("En automatisk besked om, at bestillingen er modtaget, er alene en kvittering. Aftalen er først accepteret og bindende, når STYKK har sendt en ordrebekræftelse med accept.", "BodyST"),
        P("Fortrydelsesret", "SectionST"),
        P("Ved køb i webshoppen har du som udgangspunkt 14 dage til at fortryde. Fristen regnes fra den dag, du eller en person, du har valgt (dog ikke transportøren), får varen i fysisk besiddelse. For en ordre med flere varer leveret hver for sig regnes fristen fra modtagelsen af den sidste vare.", "BodyST"),
        P("Du skal inden fristens udløb give STYKK en utvetydig besked om, at du fortryder. Du kan eksempelvis skrive til support@stykk.dk. Du kan også bruge formularen på næste side, men det er ikke et krav. Det er tilstrækkeligt, at beskeden er afsendt inden fristens udløb.", "BodyST"),
        P("Efter beskeden skal varen sendes retur uden unødig forsinkelse og senest 14 dage efter, at du har meddelt os din beslutning. Du betaler de direkte udgifter til returnering. Du må undersøge varen, som du ville kunne i en fysisk butik; du kan hæfte for en værdiforringelse, der skyldes håndtering ud over dette.", "BodyST"),
        P("Når du fortryder, tilbagebetaler vi de betalinger, vi har modtaget fra dig, herunder udgiften til den billigste standardlevering, senest 14 dage efter din besked. Vi kan tilbageholde tilbagebetalingen, indtil vi har modtaget varen retur eller dokumentation for, at den er sendt. Et eventuelt tillæg for en dyrere leveringsform end standardlevering tilbagebetales ikke.", "BodyST"),
        P("Undtagelse for individuelt fremstillede varer", "SectionST"),
        P("Fortrydelsesretten gælder ikke for en vare, der er fremstillet efter dine individuelle specifikationer eller har fået et tydeligt personligt præg. Undtagelsen gælder kun, når det er relevant for den konkrete vare og er oplyst før aftalen. En vare er ikke automatisk undtaget, blot fordi den fremstilles på bestilling eller er 3D-printet.", "BodyST"),
        P("Reklamation", "SectionST"),
        P("Du har 2 års reklamationsret efter købelovens regler. Kontakt support@stykk.dk hurtigst muligt, hvis varen har en mangel, og beskriv problemet gerne med billeder.", "BodyST"),
        PageBreak(),
        P("Standardfortrydelsesformular", "TitleST"),
        P("Udfyld og send kun denne formular, hvis du ønsker at fortryde aftalen. Formularen er frivillig; en anden tydelig besked til os kan også bruges.", "DeckST"),
        decorate_box([
            P("TIL", "LabelST"),
            P("STYKK – Design · CVR 41693908<br/>Damagervej 12 B, st. 6, 8260 Viby J, Danmark<br/>E-mail: support@stykk.dk", "BodyST"),
        ]),
        Spacer(1, 5*mm),
        P("Jeg/vi meddeler hermed, at jeg/vi ønsker at fortryde min/vores aftale om køb af følgende vare(r):", "FormST"),
        P("Vare(r): __________________________________________________________________________", "FormST"),
        P("__________________________________________________________________________________", "FormST"),
        P("Ordre nummer (hvis kendt): __________________________________________________________", "FormST"),
        P("Bestilt den: __________________________  Modtaget den: ______________________________", "FormST"),
        Spacer(1, 7*mm),
        P("Kundens navn: _____________________________________________________________________", "FormST"),
        P("Adresse: __________________________________________________________________________", "FormST"),
        P("__________________________________________________________________________________", "FormST"),
        Spacer(1, 7*mm),
        P("Dato: ________________________________", "FormST"),
        P("Kundens underskrift (kun hvis formularen indsendes på papir):", "FormST"),
        Spacer(1, 14*mm),
        HRFlowable(width="100%", thickness=.6, color=RULE, spaceBefore=2*mm, spaceAfter=4*mm),
        P("Send formularen eller en anden utvetydig fortrydelsesbesked til support@stykk.dk inden fortrydelsesfristens udløb. Gem gerne en kopi af din besked.", "SmallST"),
    ]
    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
