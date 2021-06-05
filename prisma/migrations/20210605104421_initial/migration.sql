-- CreateTable
CREATE TABLE "Shoe" (
    "shoeId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isTrending" BOOLEAN NOT NULL,
    "isSoldOut" BOOLEAN NOT NULL
);
