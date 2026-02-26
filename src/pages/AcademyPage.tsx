import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, Clock, Users, Star } from "lucide-react";

const mockCourses = [
  { id: 1, title: "Marketing Digital para B2B", instructor: "QBCAMP Academy", duration: "4h", students: 85, rating: 4.8, premium: false, category: "Marketing" },
  { id: 2, title: "Gestão Financeira Empresarial", instructor: "ConectaRH", duration: "6h", students: 120, rating: 4.9, premium: true, category: "Finanças" },
  { id: 3, title: "Liderança e Gestão de Equipes", instructor: "QBCAMP Academy", duration: "3h", students: 64, rating: 4.7, premium: false, category: "Gestão" },
  { id: 4, title: "Vendas Consultivas B2B", instructor: "TechSol Sistemas", duration: "5h", students: 92, rating: 4.6, premium: true, category: "Vendas" },
  { id: 5, title: "Compliance e LGPD", instructor: "QBCAMP Academy", duration: "2h", students: 45, rating: 4.5, premium: false, category: "Jurídico" },
  { id: 6, title: "Automação de Processos", instructor: "TechSol Sistemas", duration: "8h", students: 38, rating: 4.8, premium: true, category: "Tecnologia" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function AcademyPage() {
  return (
    <div className="py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">Academia QBCAMP</h1>
          <p className="text-muted-foreground">Capacite sua equipe com cursos criados por empresas da região.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course, i) => (
            <motion.div
              key={course.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="group flex flex-col rounded-2xl border border-border bg-card card-shadow overflow-hidden transition-all hover:card-shadow-hover hover:-translate-y-1"
            >
              <div className="relative flex h-40 items-center justify-center bg-secondary">
                <GraduationCap className="h-12 w-12 text-secondary-foreground/30" />
                <button className="absolute inset-0 flex items-center justify-center bg-secondary/0 transition-colors group-hover:bg-secondary/30">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:scale-100 scale-75">
                    <Play className="h-6 w-6 ml-0.5" />
                  </div>
                </button>
                {course.premium && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                    Premium
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="mb-1 text-xs font-medium text-primary">{course.category}</span>
                <h3 className="mb-2 text-base font-bold text-card-foreground">{course.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{course.instructor}</p>
                <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.students}</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" />{course.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
