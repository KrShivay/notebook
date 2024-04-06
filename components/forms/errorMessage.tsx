import {Fragment} from "react";
import {FieldError} from "react-hook-form";

export default function ErrorMessage({error}: {error: FieldError | undefined}) {
  return (
    <Fragment>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </Fragment>
  );
}
