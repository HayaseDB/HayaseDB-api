import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOngoingField1746884129245 implements MigrationInterface {
    name = 'AddOngoingField1746884129245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."animes_status_enum" RENAME TO "animes_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."animes_status_enum" AS ENUM('Airing', 'Ongoing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" TYPE "public"."animes_status_enum" USING "status"::"text"::"public"."animes_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."animes_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."contributions_datastatus_enum" RENAME TO "contributions_datastatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."contributions_datastatus_enum" AS ENUM('Airing', 'Ongoing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataStatus" TYPE "public"."contributions_datastatus_enum" USING "dataStatus"::"text"::"public"."contributions_datastatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."contributions_datastatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."contributions_datastatus_enum_old" AS ENUM('Airing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`);
        await queryRunner.query(`ALTER TABLE "contributions" ALTER COLUMN "dataStatus" TYPE "public"."contributions_datastatus_enum_old" USING "dataStatus"::"text"::"public"."contributions_datastatus_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."contributions_datastatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."contributions_datastatus_enum_old" RENAME TO "contributions_datastatus_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."animes_status_enum_old" AS ENUM('Airing', 'Completed', 'Upcoming', 'On Hold', 'Cancelled')`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" TYPE "public"."animes_status_enum_old" USING "status"::"text"::"public"."animes_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."animes_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."animes_status_enum_old" RENAME TO "animes_status_enum"`);
    }

}
