import {describe, it, expect, afterAll, beforeAll, beforeEach} from 'vitest';
import {auth} from './auth';
import {PrismaClient} from '@/generated/prisma/client';
import {APIError} from "better-auth";

let db: PrismaClient;

describe("Authentication - BetterAuth", function () {

    beforeAll(async () => {
        db = new PrismaClient();
    });

    afterAll(async () => {
        await db.$disconnect();
    });

    beforeEach(async () => {
        await db.account?.deleteMany();
        await db.verification?.deleteMany();
        await db.session?.deleteMany();
        await db.user?.deleteMany();
    })

    describe('User Sign Up', () => {
        it('should create a new user', async () => {
            const response = await auth.api.signUpEmail({
                body: {
                    email: 'test@example.com',
                    password: 'TestPassword1213!',
                    name: 'Test User',
                }
            });

            expect(response.user).toBeDefined();
            expect(response.user?.email).toBe('test@example.com');
            expect(response.user?.name).toBe('Test User');
        });

        it('should not allow duplicate email registration', async () => {
            await auth.api.signUpEmail({
                body: {
                    email: 'test@example.com',
                    password: 'TestPassword1213!',
                    name: 'Test User',
                }
            });

            try {
                await auth.api.signUpEmail({
                    body: {
                        email: 'test@example.com',
                        password: 'TestPassword1213!',
                        name: 'Test User 2',
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect((error as APIError).body?.code).toBe('USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL');
            }

        });
    });

    describe('User Sign In', function () {
        beforeEach(async () => {
            await auth.api.signUpEmail({
                body: {
                    email: 'signin@example.com',
                    password: 'SignInPassword1213!',
                    name: 'Sign In User',
                }
            });
        });

        it('should sign in user with correct credentials', async () => {
            const response = await auth.api.signInEmail({
                body: {
                    email: 'signin@example.com',
                    password: 'SignInPassword1213!',
                }
            });

            expect(response.user).toBeDefined();
            expect(response.user?.email).toBe('signin@example.com');
        });

        it('should fail with incorrect credentials', async () => {
            try {
                await auth.api.signInEmail({
                    body: {
                        email: 'signin@example.com',
                        password: 'IncorrectPassword!',
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect((error as APIError).body?.code).toBe('INVALID_EMAIL_OR_PASSWORD');
            }
        });

        it('should fail with non-existant email', async () => {

            try {
                await auth.api.signInEmail({
                    body: {
                        email: 'unknown@example.com',
                        password: 'SignInPassword1213!',
                    }
                });
            } catch (error) {
                expect(error).toBeInstanceOf(APIError);
                expect((error as APIError).body?.code).toBe('INVALID_EMAIL_OR_PASSWORD');
            }
        });
    });
});