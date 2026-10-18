import Link from "next/link";

/** The page that is not there: the number is cut like the name on the home page. */
export default function NotFound() {
  return (
    <main className="lost">
      <h1 className="lost-num">
        404
        <span className="lost-num-cut" aria-hidden="true">
          404
        </span>
      </h1>
      <p className="lost-line">
        Такой страницы нет. <span lang="en">There is no such page.</span>
      </p>
      <Link href="/" className="lost-home">
        ← mxsm.me
      </Link>
    </main>
  );
}
