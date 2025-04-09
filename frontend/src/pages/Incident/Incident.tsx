import { useParams } from "react-router-dom";

export const Incident = () => {
  const { id } = useParams();

  console.log(id);
  return <div>Incident</div>;
};
