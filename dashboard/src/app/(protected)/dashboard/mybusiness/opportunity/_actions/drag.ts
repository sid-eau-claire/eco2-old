let isDragging = false;

const Drag = (updateOpportunityStatus: (id: string, newStatus: string) => void): void => {
  const draggables = document.querySelectorAll<HTMLElement>('.task');
  const droppables = document.querySelectorAll<HTMLElement>('.swim-lane');

  draggables.forEach((task) => {
    task.addEventListener('dragstart', () => {
      isDragging = true;
      task.classList.add('is-dragging');
    });
    task.addEventListener('dragend', (event) => {
      if (!isDragging) return;
      isDragging = false;

      task.classList.remove('is-dragging');
      const dropZone = (event.target as HTMLElement).closest('.swim-lane');
      if (dropZone) {
        const newStatus = dropZone.getAttribute('data-status');
        const taskId = task.getAttribute('data-id');
        if (newStatus && taskId) {
          updateOpportunityStatus(taskId, newStatus);
        }
      }
    });
  });

  droppables.forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();

      const bottomTask = insertAboveTask(zone, e.clientY);
      const curTask = document.querySelector('.is-dragging') as HTMLElement;

      if (!bottomTask) {
        zone.appendChild(curTask);
      } else {
        zone.insertBefore(curTask, bottomTask);
      }
    });
  });

  const insertAboveTask = (
    zone: HTMLElement,
    mouseY: number
  ): HTMLElement | null => {
    const els = zone.querySelectorAll<HTMLElement>('.task:not(.is-dragging)');

    let closestTask: HTMLElement | null = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    els.forEach((task) => {
      const { top } = task.getBoundingClientRect();

      const offset = mouseY - top;

      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closestTask = task;
      }
    });

    return closestTask;
  };
};

export default Drag;
