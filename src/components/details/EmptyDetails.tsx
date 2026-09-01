const EmptyDetails = () => {
  return (
    <div className="flex flex-col">
      <h2 className="text-base font-bold">No vessel selected</h2>
      <p className="mt-[0.4rem] text-[0.85rem] text-ink-muted">
        Choose a vessel from the list, or click a marker on the map, to see its AIS record.
      </p>
    </div>
  );
};

export default EmptyDetails;
