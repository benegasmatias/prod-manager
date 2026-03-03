"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsersTable1772485931299 = void 0;
class CreateUsersTable1772485931299 {
    constructor() {
        this.name = 'CreateUsersTable1772485931299';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "email" character varying NOT NULL, "full_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
exports.CreateUsersTable1772485931299 = CreateUsersTable1772485931299;
//# sourceMappingURL=1772485931299-CreateUsersTable.js.map