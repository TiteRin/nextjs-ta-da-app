import {PrismaClient} from "@prisma/client";
import {beforeEach} from "vitest";
import {mockDeep, mockReset} from "vitest-mock-extended";

beforeEach(() => {
    mockReset(PrismaClient);
});

const prisma = mockDeep<PrismaClient>();
export default prisma;