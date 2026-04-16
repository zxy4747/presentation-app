"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// ⭐ recharts（SSR対策）
const RadarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadarChart),
  { ssr: false }
);
const Radar = dynamic(
  () => import("recharts").then((mod) => mod.Radar),
  { ssr: false }
);
const PolarGrid = dynamic(
  () => import("recharts").then((mod) => mod.PolarGrid),
  { ssr: false }
);
const PolarAngleAxis = dynamic(
  () => import("recharts").then((mod) => mod.PolarAngleAxis),
  { ssr: false }
);
const PolarRadiusAxis = dynamic(
  () => import("recharts").then((mod) => mod.PolarRadiusAxis),
  { ssr: false }
);

const criteria = [
  "資料の見やすさ",
  "話し方",
  "構成",
  "非言語表現",
];

export default function Page() {
  const [selfScores, setSelfScores] = useState<any>({});
  const [otherScores, setOtherScores] = useState<any>({});
  const [mode, setMode] = useState<"self" | "other">("self");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // 履歴読み込み
  useEffect(() => {
    const saved = localStorage.getItem("presentation-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleChange = (item: string, value: string) => {
    if (mode === "self") {
      setSelfScores({ ...selfScores, [item]: Number(value) });
    } else {
      setOtherScores({ ...otherScores, [item]: Number(value) });
    }
  };

  const average = (scores: any) =>
    Object.values(scores).reduce((a: any, b: any) => a + b, 0) /
    (Object.values(scores).length || 1);

  const data = criteria.map((item) => ({
    subject: item,
    self: selfScores[item] || 0,
    other: otherScores[item] || 0,
  }));

  const saveResult = () => {
    const newData = {
      selfScores,
      otherScores,
      date: new Date().toLocaleString(),
    };

    const updated = [...history, newData];
    setHistory(updated);
    localStorage.setItem("presentation-history", JSON.stringify(updated));

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          プレゼン評価アプリ
        </h1>

        {!submitted ? (
          <>
            {/* モード切り替え */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-xl ${
                  mode === "self"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setMode("self")}
              >
                自己評価
              </button>
              <button
                className={`px-4 py-2 rounded-xl ${
                  mode === "other"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setMode("other")}
              >
                他者評価
              </button>
            </div>

            {/* 入力 */}
            <div className="space-y-4">
              {criteria.map((item) => (
                <div key={item} className="border p-3 rounded-xl">
                  <p className="font-medium mb-1">{item}</p>
                  <select
                    className="w-full border p-2 rounded"
                    onChange={(e) => handleChange(item, e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              className="mt-6 w-full bg-black text-white py-2 rounded-xl"
              onClick={saveResult}
            >
              結果を見る
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">結果</h2>

            {/* 各項目 */}
            <div className="space-y-3">
              {criteria.map((item) => {
                const diff =
                  (selfScores[item] || 0) - (otherScores[item] || 0);

                return (
                  <div key={item} className="border p-3 rounded-xl">
                    <p className="font-medium">{item}</p>
                    <p>自己: {selfScores[item] || 0}</p>
                    <p>他者: {otherScores[item] || 0}</p>
                    <p
                      className={`font-bold ${
                        diff > 0
                          ? "text-red-500"
                          : diff < 0
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      差分: {diff > 0 ? `+${diff}` : diff}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 平均 */}
            <div className="mt-4">
              <p>自己平均: {average(selfScores).toFixed(2)}</p>
              <p>他者平均: {average(otherScores).toFixed(2)}</p>
            </div>

            {/* グラフ */}
            <div className="flex justify-center mt-6">
              <RadarChart
                outerRadius={100}
                width={300}
                height={250}
                data={data}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar dataKey="self" />
                <Radar dataKey="other" />
              </RadarChart>
            </div>

            {/* 履歴 */}
            <div className="mt-6">
              <h3 className="font-bold mb-2">履歴</h3>
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border p-3 rounded-xl mb-2"
                >
                  <p>{item.date}</p>
                  <button
                    className="mt-2 px-3 py-1 bg-gray-300 rounded"
                    onClick={() => {
                      setSelfScores(item.selfScores);
                      setOtherScores(item.otherScores);
                      setSubmitted(true);
                    }}
                  >
                    このデータを見る
                  </button>
                </div>
              ))}
            </div>

            <button
              className="mt-6 w-full bg-gray-800 text-white py-2 rounded-xl"
              onClick={() => setSubmitted(false)}
            >
              戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
}
