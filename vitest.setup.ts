import "@testing-library/jest-dom";
import {config} from "dotenv";
import {beforeAll} from "vitest";
import {execSync} from "node:child_process";

config({path: '.env.test', override: true})

beforeAll(async () => {
    try {
        execSync('npx prisma migrate deploy', {
            cwd: process.cwd(),
            stdio: 'pipe'
        });
    } catch (error) {
        console.error('Migration error:', error);
    }
})