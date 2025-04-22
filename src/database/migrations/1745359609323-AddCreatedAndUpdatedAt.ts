import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAndUpdatedAt1745359609323 implements MigrationInterface {
    name = 'AddCreatedAndUpdatedAt1745359609323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "animes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "dataCreatedat" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "dataUpdatedat" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "dataUpdatedat"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "dataCreatedat"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "createdAt"`);
    }

}
