import { MigrationInterface, QueryRunner } from "typeorm";

export class OriginalAnime1745520552081 implements MigrationInterface {
    name = 'OriginalAnime1745520552081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" ADD "original" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "original"`);
    }

}
