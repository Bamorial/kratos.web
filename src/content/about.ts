import { translator, type Locale } from "@/i18n/config";
import source from "./about.json";

export function getAboutContent(locale: Locale) {
  const t = translator(locale);
  const qualifications = [
    t(source[7].text, "1963 — Born in Transylvania, Romania.", "1963 — Născută în Transilvania, România."),
    t(source[8].text, "1993 — Qualified nurse.", "1993 — Asistentă medicală diplomată."),
    t(source[9].text, "2001 — Training as a communication trainer for adult education, Psychology and Sports Science, Goethe University Frankfurt.", "2001 — Formare ca trainer de comunicare pentru educația adulților, Psihologie și Știința Sportului, Universitatea Goethe Frankfurt."),
    t(source[10].text, "2007 — Certification in solution-focused systemic psychosomatics, Society for Systemic Therapy (GST), Munich.", "2007 — Certificare în psihosomatică sistemică orientată spre soluții, Societatea pentru Terapie Sistemică (GST), München."),
    t(source[11].text, "2008 — Master of Arts in humanities and social sciences: sociology, psychology and Romance studies, Goethe University Frankfurt.", "2008 — Master în științe umaniste și sociale: sociologie, psihologie și romanistică, Universitatea Goethe Frankfurt."),
    t(source[12].text, "2009–2011 — Alternative practitioner for psychotherapy; examination and authorisation by the Frankfurt health authority. Part-time work in a group practice.", "2009–2011 — Practician autorizat pentru psihoterapie (Heilpraktikerin); examen și autorizare la autoritatea sanitară Frankfurt. Activitate într-un cabinet comun."),
    t(source[13].text, "Since 2014 — Own practice in Thuine.", "Din 2014 — Cabinet propriu în Thuine."),
    t(source[14].text, "2019 — Tai Chi and Qigong instructor.", "2019 — Instructor Tai Chi și Qigong."),
    t(source[15].text, "2020 — Qigong teacher certification, German Tai Chi Association (DTB).", "2020 — Certificare ca profesor Qigong, Asociația Germană Tai Chi (DTB)."),
    t(source[16].text, "Member of the advisory board for Tai Chi and Qigong training in Germany.", "Membră a consiliului consultativ pentru formarea Tai Chi și Qigong în Germania."),
  ];
  const experience = [
    t(source[18].text, "Many years as a nurse in internal medicine, haematology, blood donation, dialysis and outpatient care.", "Mulți ani de activitate ca asistentă medicală în medicină internă, hematologie, donare de sânge, dializă și îngrijire ambulatorie."),
    t(source[19].text, "Over ten years in a clinic for psychiatry, psychotherapy and psychosomatics, working in multidisciplinary teams, therapy groups and family counselling.", "Peste zece ani într-o clinică de psihiatrie, psihoterapie și psihosomatică, în echipe multidisciplinare, grupuri de terapie și consilierea familiilor."),
    t(source[20].text, "Organisation of seminars for students and entrepreneurs in psychology and linguistics.", "Organizarea de seminare pentru studenți și antreprenori în psihologie și lingvistică."),
    t(source[21].text, "Organisation and delivery of training courses and workshops in nursing and health promotion.", "Organizarea și susținerea cursurilor și atelierelor de îngrijire și promovare a sănătății."),
    t(source[22].text, "Team and conflict counselling for healthcare organisations, social and youth services, schools and small businesses.", "Consilierea echipelor și a conflictelor în organizații medicale, servicii sociale și de tineret, școli și întreprinderi mici."),
    t(source[23].text, "Coaching and systemic counselling for staff, teams and leaders in healthcare and social services.", "Coaching și consiliere sistemică pentru angajați, echipe și manageri din sănătate și servicii sociale."),
  ];
  return { title: t(source[5].text, "Discover my personal and professional journey", "Descoperă parcursul meu personal și profesional"), name: t(source[6].text, "My name is Simona Facalau", "Numele meu este Simona Facalau"), experienceTitle: t("Berufliche Erfahrungen", "Professional experience", "Experiență profesională"), qualifications, experience };
}
