import { useGetInitiators } from "../../services/requests/initiators/getInitiators";

export const Home = () => {
  const { data, isLoading } = useGetInitiators({});
  console.log(data);

  return <div>Home</div>;
};
