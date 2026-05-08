var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Steps = (function () {

  function rowWord() {
    return (typeof Wooly.Translate !== 'undefined' && Wooly.Translate.lang === 'en') ? 'row' : 'riga';
  }

  function tipBtnText() { return rowWord() === 'row' ? '+ tip' : '+ suggerimento'; }
  function tipLabel() { return rowWord() === 'row' ? 'Tip: ' : 'Suggerimento: '; }
  function tipPlaceholder() { return rowWord() === 'row' ? 'Tip: write a hint...' : 'Suggerimento: scrivi un suggerimento...'; }
  function noteLabel() { return rowWord() === 'row' ? 'Note: ' : 'Nota: '; }
  function notePlaceholder() { return rowWord() === 'row' ? 'Note: write a note...' : 'Nota: scrivi una nota...'; }

  function makeStepHTML(num) {
    return '<span class="timeline-num">' + rowWord() + ' ' + num + '</span>' +
      '<div class="timeline-content">' +
        '<div class="timeline-text" contenteditable="true"></div>' +
        '<button class="add-tip">' + tipBtnText() + '</button>' +
        '<div class="timeline-tip" contenteditable="true"' +
          ' data-label="' + tipLabel() + '"' +
          ' data-placeholder="' + tipPlaceholder() + '"></div>' +
      '</div>' +
      '<div class="timeline-actions">' +
        '<button class="timeline-del">&times;</button>' +
      '</div>';
  }

  function makeNoteBtn() {
    var btn = document.createElement('button');
    btn.className = 'timeline-add-note';
    btn.textContent = rowWord() === 'row' ? '+ note' : '+ nota';
    return btn;
  }

  function renumber(timeline) {
    var steps = timeline.querySelectorAll('.timeline-step');
    Array.prototype.forEach.call(steps, function (s, i) {
      s.querySelector('.timeline-num').textContent = rowWord() + ' ' + (i + 1);
    });
  }

  function addStep(btn) {
    var timeline = btn.previousElementSibling;
    var count = timeline.querySelectorAll('.timeline-step').length + 1;
    var step = document.createElement('div');
    step.className = 'timeline-step';
    step.innerHTML = makeStepHTML(count);
    timeline.appendChild(step);
    timeline.appendChild(makeNoteBtn());
    step.querySelector('.timeline-text').focus();
  }

  function addBlock(container) {
    var block = document.createElement('div');
    block.className = 'steps-block';
    block.innerHTML =
      '<div class="steps-header" contenteditable="true"></div>' +
      '<div class="timeline">' +
        '<div class="timeline-step">' + makeStepHTML(1) + '</div>' +
        '<div class="timeline-step">' + makeStepHTML(2) + '</div>' +
        '<div class="timeline-step">' + makeStepHTML(3) + '</div>' +
      '</div>' +
      '<button class="add-step">' + (rowWord() === 'row' ? '+ Add row' : '+ Aggiungi passaggio') + '</button>';
    var timeline = block.querySelector('.timeline');
    var steps = timeline.querySelectorAll('.timeline-step');
    Array.prototype.forEach.call(steps, function (s) {
      timeline.insertBefore(makeNoteBtn(), s.nextSibling);
    });
    container.appendChild(block);
    block.querySelector('.steps-header').focus();
  }

  function delStep(btn) {
    var step = btn.closest('.timeline-step');
    var timeline = step.closest('.timeline');
    var next = step.nextElementSibling;
    var prev = step.previousElementSibling;
    if (next && (next.classList.contains('timeline-add-note') || next.classList.contains('timeline-note-between'))) {
      next.remove();
    } else if (prev && (prev.classList.contains('timeline-add-note') || prev.classList.contains('timeline-note-between'))) {
      prev.remove();
    }
    step.remove();
    renumber(timeline);
  }

  function addTip(btn) {
    var tip = btn.closest('.timeline-step').querySelector('.timeline-tip');
    btn.style.display = 'none';
    tip.style.display = 'block';
    tip.focus();
    tip.addEventListener('blur', function () {
      if (!tip.textContent.trim()) {
        tip.innerHTML = '';
        tip.style.display = 'none';
        btn.style.display = '';
      }
    }, { once: true });
  }

  function addNoteBetween(btn) {
    var note = document.createElement('div');
    note.className = 'timeline-note-between';
    note.setAttribute('contenteditable', 'true');
    note.setAttribute('data-label', noteLabel());
    note.setAttribute('data-placeholder', notePlaceholder());
    btn.parentNode.insertBefore(note, btn);
    note.focus();
    btn.remove();
  }

  return {
    addStep:        addStep,
    addBlock:       addBlock,
    delStep:        delStep,
    addTip:         addTip,
    addNoteBetween: addNoteBetween,
    makeStepHTML:   makeStepHTML,
    renumber:       renumber
  };

})();
