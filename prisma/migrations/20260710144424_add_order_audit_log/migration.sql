-- CreateTable
CREATE TABLE "order_histories" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_histories" ADD CONSTRAINT "order_histories_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
