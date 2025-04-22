import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAndUpdatedAt1745357183352 implements MigrationInterface {
    name = 'AddCreatedAndUpdatedAt1745357183352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ADD "createdAt" date DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "animes" ADD "updatedAt" date DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "dataCreatedat" date DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "dataUpdatedat" date DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "dataUpdatedat"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "dataCreatedat"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "createdAt"`);
    }

}
