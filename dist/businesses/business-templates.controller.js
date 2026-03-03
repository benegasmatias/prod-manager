"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const businesses_service_1 = require("./businesses.service");
const supabase_auth_guard_1 = require("../users/guards/supabase-auth.guard");
let BusinessTemplatesController = class BusinessTemplatesController {
    constructor(businessesService) {
        this.businessesService = businessesService;
    }
    async getTemplates() {
        return await this.businessesService.getTemplates();
    }
};
exports.BusinessTemplatesController = BusinessTemplatesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessTemplatesController.prototype, "getTemplates", null);
exports.BusinessTemplatesController = BusinessTemplatesController = __decorate([
    (0, common_1.Controller)('business-templates'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [businesses_service_1.BusinessesService])
], BusinessTemplatesController);
//# sourceMappingURL=business-templates.controller.js.map