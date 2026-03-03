import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBusinessesAndDefaultBusinessId1772502794397 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
