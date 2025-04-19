import { useSelector } from "react-redux";
import { useGetInitiators } from "../../services/requests/initiators/getInitiators";
import { selectUserSelector } from "../../store/features/user/selectors";

export const Home = () => {
  const { data, isLoading } = useGetInitiators({});
  console.log(data);
  const user = useSelector(selectUserSelector);

  console.log(user);

  return <div>Home</div>;
};
