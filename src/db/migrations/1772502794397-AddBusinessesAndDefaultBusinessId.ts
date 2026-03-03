import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessesAndDefaultBusinessId1772502794397 implements MigrationInterface {
    name = 'AddBusinessesAndDefaultBusinessId1772502794397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."business_memberships_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER')`);
        await queryRunner.query(`CREATE TABLE "business_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "business_id" uuid NOT NULL, "role" "public"."business_memberships_role_enum" NOT NULL DEFAULT 'MEMBER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2ec57e95d3c84ce5547f0bd2d69" UNIQUE ("user_id", "business_id"), CONSTRAINT "PK_175d328b8efceccea96a421d8f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "businesses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "taxId" character varying, "address" character varying, "phone" character varying, "category" character varying NOT NULL DEFAULT 'GENERICO', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc1bf63498dd2368ce3dc8686e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "default_business_id" uuid`);
        await queryRunner.query(`ALTER TABLE "business_memberships" ADD CONSTRAINT "FK_084ba14a564f50700a6bba294c4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "business_memberships" ADD CONSTRAINT "FK_4e40cad67e52269e5d14db61a74" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "business_memberships" DROP CONSTRAINT "FK_4e40cad67e52269e5d14db61a74"`);
        await queryRunner.query(`ALTER TABLE "business_memberships" DROP CONSTRAINT "FK_084ba14a564f50700a6bba294c4"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "default_business_id"`);
        await queryRunner.query(`DROP TABLE "businesses"`);
        await queryRunner.query(`DROP TABLE "business_memberships"`);
        await queryRunner.query(`DROP TYPE "public"."business_memberships_role_enum"`);
    }

}
