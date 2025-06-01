import { useParams } from 'react-router-dom';

export const IncidentProvider = () => {
  const { id } = useParams();

  console.log(id);
  return (
    <>IncidentProvider</>
  )
}
