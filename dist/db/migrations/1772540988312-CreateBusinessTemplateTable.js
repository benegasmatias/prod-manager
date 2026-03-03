"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBusinessTemplateTable1772540988312 = void 0;
class CreateBusinessTemplateTable1772540988312 {
    constructor() {
        this.name = 'CreateBusinessTemplateTable1772540988312';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "business_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "image_key" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a826f84d9468ddd537337afb903" UNIQUE ("key"), CONSTRAINT "PK_94778035d0611f4ed339b146363" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "business_templates" ("key", "name", "description", "image_key") VALUES 
            ('IMPRESIONES_3D', 'Impresiones 3D', 'Ideal para talleres de manufactura aditiva, control de filamento y tiempos de impresión.', '3d'),
            ('METALURGICA', 'Metalúrgica', 'Gestión de piezas, cortes, planos y seguimiento de procesos metalúrgicos.', 'metal'),
            ('CARPINTERIA', 'Carpintería', 'Control de materiales, despieces y producción de muebles personalizados.', 'carpentry')
        `);
        await queryRunner.query(`ALTER TABLE "orders" ADD "business_id" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_0e78f67403faf37092dce90d73a" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_0e78f67403faf37092dce90d73a"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "business_id"`);
        await queryRunner.query(`DROP TABLE "business_templates"`);
    }
}
exports.CreateBusinessTemplateTable1772540988312 = CreateBusinessTemplateTable1772540988312;
//# sourceMappingURL=1772540988312-CreateBusinessTemplateTable.js.map