-- CreateIndex
CREATE INDEX "images_userId_createdAt_idx" ON "images"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "images_userId_folderId_createdAt_idx" ON "images"("userId", "folderId", "createdAt");

-- CreateIndex
CREATE INDEX "images_userId_status_idx" ON "images"("userId", "status");

-- CreateIndex
CREATE INDEX "images_userId_roomType_idx" ON "images"("userId", "roomType");

-- CreateIndex
CREATE INDEX "team_invites_tenantId_idx" ON "team_invites"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clerkId_idx" ON "users"("clerkId");
