import { useMemo, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Activity, Stethoscope, TestTube2, Thermometer, Wind } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const PRIOR_DISEASE = 0.05;

const LIKELIHOODS = {
  fever: { disease: 0.8, noDisease: 0.2 },
  cough: { disease: 0.7, noDisease: 0.3 },
  test: { disease: 0.9, noDisease: 0.1 },
};

type EvidenceState = {
  fever: boolean;
  cough: boolean;
  test: boolean;
};

const evidenceContribution = (isPresent: boolean, probability: number) =>
  isPresent ? probability : 1 - probability;

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const calculatePosterior = ({ fever, cough, test }: EvidenceState) => {
  const pEvidenceGivenDisease =
    evidenceContribution(fever, LIKELIHOODS.fever.disease) *
    evidenceContribution(cough, LIKELIHOODS.cough.disease) *
    evidenceContribution(test, LIKELIHOODS.test.disease);

  const pEvidenceGivenNoDisease =
    evidenceContribution(fever, LIKELIHOODS.fever.noDisease) *
    evidenceContribution(cough, LIKELIHOODS.cough.noDisease) *
    evidenceContribution(test, LIKELIHOODS.test.noDisease);

  const numerator = PRIOR_DISEASE * pEvidenceGivenDisease;
  const denominator = numerator + (1 - PRIOR_DISEASE) * pEvidenceGivenNoDisease;

  return denominator === 0 ? 0 : numerator / denominator;
};

const Node = ({
  title,
  icon: Icon,
  className,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) => (
  <div
    className={`absolute flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm ${className ?? ""}`}
  >
    <Icon className="h-4 w-4 text-sky-600" />
    <span className="text-sm font-medium text-slate-700">{title}</span>
  </div>
);

export default function MedicalBayesianNetwork() {
  const [fever, setFever] = useState(false);
  const [cough, setCough] = useState(false);
  const [positiveTest, setPositiveTest] = useState(false);
  const [posteriorProbability, setPosteriorProbability] = useState(0);
  const [hasDiagnosed, setHasDiagnosed] = useState(false);

  const percentage = useMemo(() => roundToOneDecimal(posteriorProbability * 100), [posteriorProbability]);

  const diagnose = () => {
    const probability = calculatePosterior({
      fever,
      cough,
      test: positiveTest,
    });

    setPosteriorProbability(probability);
    setHasDiagnosed(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        <div className="flex items-center justify-center gap-3">
          <Stethoscope className="h-7 w-7 text-sky-600" />
          <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">
            Medical Bayesian Network
          </h1>
        </div>

        <Card className="rounded-2xl border-slate-200 p-6 shadow-sm">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-50">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <marker
                  id="arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
                </marker>
              </defs>
              <line x1="50" y1="25" x2="20" y2="70" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="50" y1="25" x2="50" y2="70" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="50" y1="25" x2="80" y2="70" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
            </svg>

            <Node title="Disease" icon={Activity} className="left-1/2 top-6 -translate-x-1/2" />
            <Node title="Fever" icon={Thermometer} className="left-[10%] top-[62%]" />
            <Node title="Cough" icon={Wind} className="left-1/2 top-[62%] -translate-x-1/2" />
            <Node title="Test" icon={TestTube2} className="right-[10%] top-[62%]" />
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Fever</span>
              <Switch checked={fever} onCheckedChange={setFever} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Cough</span>
              <Switch checked={cough} onCheckedChange={setCough} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-slate-700">Positive Test</span>
              <Switch checked={positiveTest} onCheckedChange={setPositiveTest} />
            </div>
          </div>

          <Button onClick={diagnose} className="mt-6 w-full rounded-xl bg-sky-600 text-white hover:bg-sky-700 md:w-auto">
            Diagnose
          </Button>
        </Card>

        <motion.div
          key={`${posteriorProbability}-${hasDiagnosed}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="rounded-2xl border-slate-200 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Posterior Probability of Disease</p>
                <p className="text-4xl font-bold text-slate-800 md:text-5xl">{hasDiagnosed ? `${percentage}%` : "0.0%"}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
