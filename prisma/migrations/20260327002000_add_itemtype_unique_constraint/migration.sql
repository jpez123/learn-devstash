-- CreateIndex
CREATE UNIQUE INDEX "ItemType_name_isSystem_key" ON "ItemType"("name", "isSystem");
