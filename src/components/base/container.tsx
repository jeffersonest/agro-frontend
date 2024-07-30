import { ContainerProps } from "../../types/container.interface";

const Container: React.FC<ContainerProps> = ({ children, ...rest }) => {
  return (
    <div className="container p-1 lg:p-3 bg-slate-100" {...rest}>
      {children}
    </div>
  );
}

export default Container;
