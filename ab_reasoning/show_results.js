import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
    'o1-preview',
    'o1-mini',
    'claude-3-5-sonnet-20240620',
    'meta-llama_llama-3.1-405b-instruct',
    'gpt-4o-2024-08-06'
];

function getScores(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const scores = new Array(10).fill(0);
    for (let i = 0; i < 10; i++) {
        const regex = new RegExp(`- S${i}: 1`);
        if (regex.test(content)) {
            scores[i] = 1;
        }
    }
    return scores;
}

function printTable(model, allScores) {
    console.log(`${model}:`);
    let totalScore = 0;
    for (let q = 0; q < 10; q++) {
        const row = allScores[q].map(score => score === 1 ? '✓' : '✗').join('');
        const correctCount = allScores[q].filter(score => score === 1).length;
        totalScore += correctCount;
        console.log(`Q${q}: ${row} (${correctCount}/10)`);
    }
    const averageScore = (totalScore / 10).toFixed(2);
    console.log(`Score: ${averageScore}/10`);
    console.log();
}

const resultDir = path.join(__dirname, 'result');
const allModelScores = {};

models.forEach(model => {
    allModelScores[model] = Array.from({ length: 10 }, () => []);
    for (let run = 0; run < 10; run++) {
        const filePath = path.join(resultDir, `run_${run}`, `${model}.txt`);
        if (fs.existsSync(filePath)) {
            const scores = getScores(filePath);
            scores.forEach((score, index) => {
                allModelScores[model][index].push(score);
            });
        } else {
            console.error(`File not found: ${filePath}`);
            for (let i = 0; i < 10; i++) {
                allModelScores[model][i].push(0);
            }
        }
    }
});

models.forEach(model => {
    printTable(model, allModelScores[model]);
});
