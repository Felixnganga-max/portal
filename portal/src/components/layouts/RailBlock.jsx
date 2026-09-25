import Panel from "./Panel";

const RailBlock = ({ title, description, action, emptyMessage, children }) => (
  <Panel title={title} description={description} action={action}>
    {children || <p className="text-xs text-subtle">{emptyMessage}</p>}
  </Panel>
);

export default RailBlock;
