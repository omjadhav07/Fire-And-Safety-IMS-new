import React, { useEffect, useState } from "react";
import { getBookById } from "./libraryService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { titleCase, availableOf } from "../../services/helpers";

// GET /library/books/:id
const BookDetails = ({ id, categoryName, onClose }) => {
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getBookById(id)
      .then((b) => !cancelled && setBook(b))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load book")));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const avail = book ? availableOf(book) : undefined;
  const rows = book && [
    ["Title", book.title],
    ["Author", book.author],
    ["Category", categoryName(book)],
    ["Book code", book.bookCode],
    ["Total copies", book.totalQty],
    ["Available copies", avail],
    ["Status", titleCase(book.status || "active")],
  ];

  return (
    <Modal title="Book details" onClose={onClose}>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!book && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {book && (
        <dl className="divide-y divide-gray-100 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900 text-right">{value ?? "-"}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
};

export default BookDetails;
