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

/*
  行動観察ベース評価項目
  コミュニケーション研究・教育工学を参考
*/

const evaluationItems = [
    {
        title: "内容理解",

        purpose:
            "聞き手が内容を理解しやすい説明になっているか",

        theory:
            "Mayerのマルチメディア学習理論や認知負荷理論では、具体例や用語説明が理解促進に有効とされる。",

        points: [
            {
                label: "専門用語を説明していた",

                exampleGood:
                    "「SSRとはサーバ側で画面を生成する技術です」のように説明していた",

                exampleBad:
                    "専門用語だけを使い説明がなかった",
            },

            {
                label: "具体例を用いていた",

                exampleGood:
                    "実際の使用場面を例に説明していた",

                exampleBad:
                    "抽象的な説明のみだった",
            },

            {
                label: "結論が明確だった",

                exampleGood:
                    "最後に何を伝えたいかまとめていた",

                exampleBad:
                    "結論が分かりにくかった",
            },

            {
                label: "説明に一貫性があった",

                exampleGood:
                    "前後で説明内容がつながっていた",

                exampleBad:
                    "途中で話の内容が変わっていた",
            },
        ],
    },

    {
        title: "構成",

        purpose:
            "話の流れや順序が整理されていたか",

        theory:
            "談話構造研究では、導入・本論・結論が整理されることで理解しやすくなるとされる。",

        points: [
            {
                label: "最初に目的説明があった",

                exampleGood:
                    "「今回は○○について説明します」と最初に述べていた",

                exampleBad:
                    "何について話すか分からないまま始まった",
            },

            {
                label: "話題の切り替えが明確だった",

                exampleGood:
                    "「次に」「続いて」などを使っていた",

                exampleBad:
                    "突然別の話題へ移っていた",
            },

            {
                label: "順序立てて説明していた",

                exampleGood:
                    "背景→方法→結果の順で説明していた",

                exampleBad:
                    "説明順がばらばらだった",
            },

            {
                label: "最後にまとめがあった",

                exampleGood:
                    "最後に要点を振り返っていた",

                exampleBad:
                    "まとめ無しで終了した",
            },
        ],
    },

    {
        title: "話し方",

        purpose:
            "音声による伝達が適切だったか",

        theory:
            "韻律研究では、声量・速度・抑揚は聞き取りや理解に影響するとされる。",

        points: [
            {
                label: "適切な声量だった",

                exampleGood:
                    "後ろまで聞こえる声量だった",

                exampleBad:
                    "声が小さく聞き取りづらかった",
            },

            {
                label: "話す速度が一定だった",

                exampleGood:
                    "落ち着いた速さで話していた",

                exampleBad:
                    "早口になっていた",
            },

            {
                label: "聞き取りやすい発音だった",

                exampleGood:
                    "はっきり発音していた",

                exampleBad:
                    "語尾が聞き取りにくかった",
            },

            {
                label: "重要部分を強調していた",

                exampleGood:
                    "重要部分でゆっくり話していた",

                exampleBad:
                    "すべて同じ調子で話していた",
            },
        ],
    },

    {
        title: "非言語表現",

        purpose:
            "視線や姿勢などの非言語行動が適切だったか",

        theory:
            "Mehrabianの非言語コミュニケーション研究では、視線や表情は印象形成へ影響するとされる。",

        points: [
            {
                label: "聞き手へ視線を向けていた",

                exampleGood:
                    "聞き手を見ながら説明していた",

                exampleBad:
                    "下を向いていた",
            },

            {
                label: "姿勢が安定していた",

                exampleGood:
                    "落ち着いた姿勢で立っていた",

                exampleBad:
                    "体が揺れていた",
            },

            {
                label: "表情が自然だった",

                exampleGood:
                    "自然な表情で話していた",

                exampleBad:
                    "緊張で表情が固かった",
            },

            {
                label: "適切なジェスチャーがあった",

                exampleGood:
                    "図を示しながら説明していた",

                exampleBad:
                    "終始無表情だった",
            },
        ],
    },

    {
        title: "資料",

        purpose:
            "視覚資料が内容理解を支援していたか",

        theory:
            "マルチメディア学習理論では、図表活用や情報量調整が理解促進に有効とされる。",

        points: [
            {
                label: "文字サイズが適切だった",

                exampleGood:
                    "後方からでも読める大きさだった",

                exampleBad:
                    "文字が小さかった",
            },

            {
                label: "情報量が適切だった",

                exampleGood:
                    "1スライド1メッセージだった",

                exampleBad:
                    "文字が多すぎた",
            },

            {
                label: "配色が見やすかった",

                exampleGood:
                    "背景と文字のコントラストが明確だった",

                exampleBad:
                    "文字が背景と同化していた",
            },

            {
                label: "図表を活用していた",

                exampleGood:
                    "グラフや図を使用していた",

                exampleBad:
                    "文章だけだった",
            },
        ],
    },

    {
        title: "質疑応答",

        purpose:
            "質問へ適切に対応できていたか",

        theory:
            "双方向コミュニケーション研究では、確認・応答・修正が重要とされる。",

        points: [
            {
                label: "質問内容を理解していた",

                exampleGood:
                    "質問内容を確認していた",

                exampleBad:
                    "質問と異なる回答をしていた",
            },

            {
                label: "簡潔に回答していた",

                exampleGood:
                    "短く要点をまとめていた",

                exampleBad:
                    "回答が長すぎた",
            },

            {
                label: "質問へ適切に回答していた",

                exampleGood:
                    "質問意図に沿って回答していた",

                exampleBad:
                    "論点がずれていた",
            },

            {
                label: "落ち着いて対応していた",

                exampleGood:
                    "慌てず回答していた",

                exampleBad:
                    "焦って回答していた",
            },
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
            scores[item.title][point.label] = 3;
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

            <div className="max-w-7xl mx-auto space-y-8">

                {/* タイトル */}
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        報告能力向上支援システム
                    </h1>

                    <p className="text-slate-700 leading-8">
                        自己評価と他者評価を比較し、
                        報告時の認識差を可視化することで、
                        報告能力向上を支援する。
                    </p>

                </div>

                {/* 評価 */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* 自己評価 */}
                    <div className="bg-white rounded-3xl shadow-lg p-6">

                        <h2 className="text-2xl font-bold mb-6">
                            自己評価
                        </h2>

                        <div className="space-y-8">

                            {evaluationItems.map((item) => (

                                <div
                                    key={item.title}
                                    className="border rounded-2xl p-5"
                                >

                                    <h3 className="text-2xl font-bold mb-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-slate-600 mb-2">
                                        {item.purpose}
                                    </p>

                                    <div className="bg-blue-50 rounded-xl p-4 mb-5">

                                        <p className="font-semibold mb-2">
                                            理論的根拠
                                        </p>

                                        <p className="text-sm text-slate-700 leading-7">
                                            {item.theory}
                                        </p>

                                    </div>

                                    <div className="space-y-6">

                                        {item.points.map((point) => (

                                            <div
                                                key={point.label}
                                                className="border rounded-xl p-4"
                                            >

                                                <p className="font-bold mb-3">
                                                    {point.label}
                                                </p>

                                                <div className="space-y-2 text-sm mb-4">

                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <span className="font-semibold text-green-700">
                                                            良い例:
                                                        </span>

                                                        <p>{point.exampleGood}</p>
                                                    </div>

                                                    <div className="bg-red-50 p-3 rounded-lg">
                                                        <span className="font-semibold text-red-700">
                                                            悪い例:
                                                        </span>

                                                        <p>{point.exampleBad}</p>
                                                    </div>

                                                </div>

                                                <div className="flex justify-between mb-2">

                                                    <span className="text-sm">
                                                        評価
                                                    </span>

                                                    <span className="font-bold text-blue-600">
                                                        {
                                                            selfScores[item.title][
                                                            point.label
                                                            ]
                                                        }
                                                    </span>

                                                </div>

                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    value={
                                                        selfScores[item.title][
                                                        point.label
                                                        ]
                                                    }
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            "self",
                                                            item.title,
                                                            point.label,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full"
                                                />

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* 他者評価 */}
                    <div className="bg-white rounded-3xl shadow-lg p-6">

                        <h2 className="text-2xl font-bold mb-6">
                            他者評価
                        </h2>

                        <div className="space-y-8">

                            {evaluationItems.map((item) => (

                                <div
                                    key={item.title}
                                    className="border rounded-2xl p-5"
                                >

                                    <h3 className="text-2xl font-bold mb-4">
                                        {item.title}
                                    </h3>

                                    <div className="space-y-6">

                                        {item.points.map((point) => (

                                            <div
                                                key={point.label}
                                                className="border rounded-xl p-4"
                                            >

                                                <p className="font-bold mb-3">
                                                    {point.label}
                                                </p>

                                                <div className="flex justify-between mb-2">

                                                    <span className="text-sm">
                                                        評価
                                                    </span>

                                                    <span className="font-bold text-red-600">
                                                        {
                                                            otherScores[item.title][
                                                            point.label
                                                            ]
                                                        }
                                                    </span>

                                                </div>

                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    value={
                                                        otherScores[item.title][
                                                        point.label
                                                        ]
                                                    }
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            "other",
                                                            item.title,
                                                            point.label,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="w-full"
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
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">

                    <h2 className="text-2xl font-bold mb-6">
                        評価比較チャート
                    </h2>

                    <div className="w-full min-h-[300px]">

                        <ResponsiveContainer
                            width="100%"
                            height={400}
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

            </div>

        </main>
    );
}