"use client";

import { useMemo, useState } from "react";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
} from "recharts";

const evaluationItems = [
    {
        title: "内容理解",
        question: "説明は分かりやすかったですか？",

        points: [
            "専門用語が多すぎない",
            "説明が理解しやすい",
            "内容を理解できる",
        ],
    },

    {
        title: "構成力",
        question: "話の流れは整理されていましたか？",

        points: [
            "導入が分かりやすい",
            "話の順番が整理されている",
            "結論が明確",
        ],
    },

    {
        title: "話し方",
        question: "聞き取りやすい話し方でしたか？",

        points: [
            "声量が適切",
            "話す速さが適切",
            "抑揚がある",
        ],
    },

    {
        title: "非言語表現",
        question: "視線や表情は適切でしたか？",

        points: [
            "視線が合っている",
            "表情が自然",
            "ジェスチャーが適切",
        ],
    },

    {
        title: "資料の見やすさ",
        question: "資料は見やすかったですか？",

        points: [
            "文字量が適切",
            "配色が見やすい",
            "図表が分かりやすい",
        ],
    },
];

type PointScores = Record<string, number>;

type SectionScores = Record<string, PointScores>;

const createInitialScores = (): SectionScores => {
    const scores: SectionScores = {};

    evaluationItems.forEach((item) => {
        scores[item.title] = {};

        item.points.forEach((point) => {
            scores[item.title][point] = 3;
        });
    });

    return scores;
};

export default function ReportSupportSystem() {
    const [selfScores, setSelfScores] =
        useState<SectionScores>(createInitialScores());

    const [otherScores, setOtherScores] =
        useState<SectionScores>(createInitialScores());

    const handleScoreChange = (
        type: "self" | "other",
        section: string,
        point: string,
        value: number
    ) => {
        if (type === "self") {
            setSelfScores({
                ...selfScores,

                [section]: {
                    ...selfScores[section],
                    [point]: value,
                },
            });
        } else {
            setOtherScores({
                ...otherScores,

                [section]: {
                    ...otherScores[section],
                    [point]: value,
                },
            });
        }
    };

    const chartData = useMemo(() => {
        return evaluationItems.map((item) => {
            const selfValues = Object.values(
                selfScores[item.title]
            );

            const otherValues = Object.values(
                otherScores[item.title]
            );

            const selfAverage =
                selfValues.reduce((a, b) => a + b, 0) /
                selfValues.length;

            const otherAverage =
                otherValues.reduce((a, b) => a + b, 0) /
                otherValues.length;

            return {
                subject: item.title,
                自己評価: Number(selfAverage.toFixed(2)),
                他者評価: Number(otherAverage.toFixed(2)),
            };
        });
    }, [selfScores, otherScores]);

    return (
        <main className="min-h-screen bg-slate-100 p-4 md:p-6">

            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                {/* タイトル */}
                <div className="bg-white rounded-3xl shadow-lg p-4 md:p-8">

                    <h1 className="text-2xl md:text-4xl font-bold mb-4">
                        報告能力向上支援システム
                    </h1>

                    <p className="text-sm md:text-base text-slate-700 leading-7 md:leading-8">
                        自己評価と他者評価を比較し、
                        報告時の認識差を可視化することで、
                        報告能力向上を支援する。
                    </p>

                </div>

                {/* 評価エリア */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* 自己評価 */}
                    <div className="bg-white rounded-3xl shadow-lg p-4 md:p-6">

                        <h2 className="text-xl md:text-2xl font-bold mb-6">
                            自己評価
                        </h2>

                        <div className="space-y-6 md:space-y-8">

                            {evaluationItems.map((item) => (

                                <div
                                    key={item.title}
                                    className="border rounded-2xl p-4 md:p-5"
                                >

                                    <h3 className="text-lg md:text-xl font-bold mb-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 mb-5">
                                        {item.question}
                                    </p>

                                    <div className="space-y-5">

                                        {item.points.map((point) => (

                                            <div key={point}>

                                                <div className="flex justify-between mb-2 gap-3">

                                                    <span className="text-sm break-words">
                                                        {point}
                                                    </span>

                                                    <span className="font-bold text-blue-600">
                                                        {
                                                            selfScores[item.title][point]
                                                        }
                                                    </span>

                                                </div>

                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    value={
                                                        selfScores[item.title][point]
                                                    }
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            "self",
                                                            item.title,
                                                            point,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full h-3"
                                                />

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* 他者評価 */}
                    <div className="bg-white rounded-3xl shadow-lg p-4 md:p-6">

                        <h2 className="text-xl md:text-2xl font-bold mb-6">
                            他者評価
                        </h2>

                        <div className="space-y-6 md:space-y-8">

                            {evaluationItems.map((item) => (

                                <div
                                    key={item.title}
                                    className="border rounded-2xl p-4 md:p-5"
                                >

                                    <h3 className="text-lg md:text-xl font-bold mb-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 mb-5">
                                        {item.question}
                                    </p>

                                    <div className="space-y-5">

                                        {item.points.map((point) => (

                                            <div key={point}>

                                                <div className="flex justify-between mb-2 gap-3">

                                                    <span className="text-sm break-words">
                                                        {point}
                                                    </span>

                                                    <span className="font-bold text-red-600">
                                                        {
                                                            otherScores[item.title][point]
                                                        }
                                                    </span>

                                                </div>

                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    value={
                                                        otherScores[item.title][point]
                                                    }
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            "other",
                                                            item.title,
                                                            point,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full h-3"
                                                />

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

                {/* レーダーチャート */}
                <div className="bg-white rounded-3xl shadow-lg p-4 md:p-8">

                    <h2 className="text-xl md:text-2xl font-bold mb-6">
                        評価比較チャート
                    </h2>

                    <div className="h-[300px] md:h-[500px]">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <RadarChart data={chartData}>

                                <PolarGrid />

                                <PolarAngleAxis dataKey="subject" />

                                <PolarRadiusAxis domain={[0, 5]} />

                                <Radar
                                    name="自己評価"
                                    dataKey="自己評価"
                                    stroke="#2563eb"
                                    fill="#2563eb"
                                    fillOpacity={0.4}
                                />

                                <Radar
                                    name="他者評価"
                                    dataKey="他者評価"
                                    stroke="#dc2626"
                                    fill="#dc2626"
                                    fillOpacity={0.3}
                                />

                                <Legend />

                            </RadarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

                {/* 詳細差分分析 */}
                <div className="bg-white rounded-3xl shadow-lg p-4 md:p-8">

                    <h2 className="text-xl md:text-2xl font-bold mb-6">
                        詳細差分分析
                    </h2>

                    <div className="space-y-6">

                        {evaluationItems.map((item) => (

                            <div
                                key={item.title}
                                className="border rounded-2xl p-4 md:p-6"
                            >

                                <h3 className="text-lg md:text-xl font-bold mb-4">
                                    {item.title}
                                </h3>

                                <div className="space-y-3">

                                    {item.points.map((point) => {

                                        const self =
                                            selfScores[item.title][point];

                                        const other =
                                            otherScores[item.title][point];

                                        const diff = Math.abs(
                                            self - other
                                        );

                                        return (
                                            <div
                                                key={point}
                                                className="
                          grid
                          grid-cols-1
                          md:grid-cols-4
                          gap-2
                          md:gap-4
                          items-center
                          border-b
                          pb-3
                        "
                                            >

                                                <div className="font-medium break-words">
                                                    {point}
                                                </div>

                                                <div className="text-blue-600 font-bold">
                                                    自己: {self}
                                                </div>

                                                <div className="text-red-600 font-bold">
                                                    他者: {other}
                                                </div>

                                                <div className="text-emerald-600 font-bold">
                                                    差分: {diff}
                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </main>
    );
}