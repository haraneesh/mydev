import { toast, Slide } from 'react-toastify';

toast.configure({
  position: toast.POSITION.TOP_CENTER,
  autoClose: 3000,
  pauseOnHover: true,
  transition: Slide,
  hideProgressBar: true,
});
