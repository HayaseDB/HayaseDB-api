import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableTitle1745368711348 implements MigrationInterface {
    name = 'NullableTitle1745368711348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataTitle" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "title" SET NOT NULL`);
    }

}
