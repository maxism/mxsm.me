import Link from "next/link";
import { FieldBackground } from "@/components/effects/FieldBackground";

/** The page that is not there: the number is cut like the name on the home page, with the live map below. */
export default function NotFound() {
  return (
    <div className="lost-page">
      <FieldBackground />
      <main className="lost">
        <div className="lost-top" aria-hidden="true" />
        <h1 className="lost-num">
          404
          <span className="lost-num-cut" aria-hidden="true">
            404
          </span>
        </h1>
        <div className="lost-foot">
          <p className="lost-line">
            Такой страницы нет. <span lang="en">There is no such page.</span>
          </p>
          <Link href="/" className="lost-home">
            ← mxsm.me
          </Link>
        </div>
      </main>
    </div>
  );
}
