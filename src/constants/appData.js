import { PlusCircle, Search, Edit3, History } from "lucide-react";

export const navItems = [
  { id: "cadastrar", label: "Cadastrar Nova Formulação", icon: PlusCircle },
  { id: "buscar", label: "Buscar Formulações", icon: Search },
  { id: "gerenciar", label: "Gerenciar Formulações", icon: Edit3 },
  { id: "revisadas", label: "Formulações Revisadas", icon: History }
];

export const initialHistory = [{
  id: 101,
  formulaName: "Pasta de Dente Total Care",
  changedBy: "Dra. Helena Martins",
  role: "Farmacêutica Responsável",
  date: "21/05/2026 às 14:32",
  fieldChanged: "Dosagem do Ingrediente Ativo",
  oldValue: "Flúor Ativo (0.20%)",
  newValue: "Flúor Ativo (0.24%)",
  reason: "Ajuste de conformidade técnica."
}];
